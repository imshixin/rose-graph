<!--
 * @Author: imsixn
 * @Date: 2022-04-26 10:16:40
 * @LastEditors: imsixn
 * @LastEditTime: 2022-05-02 22:41:36
 * @Description: file content
-->
<template>
  <div class="common-layout">
    <el-container>
      <el-header id="header">玫瑰花图生成器</el-header>
      <el-container>
        <el-main>
          <el-row>
            <el-col :span="12">
              <el-card class="left-card">
                <template #header>
                  <el-row>
                    <el-col :span="8">
                      <el-upload
                        accept=".csv"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="handleChange"
                      >
                        <el-button type="primary">导入CSV文件</el-button>
                      </el-upload>
                    </el-col>
                    <el-col :span="8">
                      <el-divider
                        direction="vertical"
                        style="height: 100%"
                      ></el-divider>
                    </el-col>
                    <el-col :span="8">
                      <el-button
                        type="primary"
                        class=""
                        :disabled="this.canRender"
                        @click="updateChart"
                        >绘制玫瑰花图</el-button
                      >
                    </el-col>
                  </el-row>
                </template>
                <!-- 表格 -->
                <el-row justify="space-between" :gutter="10">
                  <el-col :span="8">
                    <el-table
                      :data="tableData"
                      stripe
                      border
                      :height="this.tableHeight"
                      class="table main-table"
                      @cell-click="cellClick"
                    >
                      <el-table-column prop="strike" label="走向">
                      </el-table-column>
                      <el-table-column prop="dip" label="倾角">
                      </el-table-column>
                    </el-table>
                  </el-col>
                  <el-col :span="8">
                    <el-table
                      :height="this.tableHeight"
                      stripe
                      border
                      class="table strike-table"
                      :data="this.avgData.strike"
                    >
                      <el-table-column
                        label="走向均值"
                        :width="this.tableWidth"
                      >
                        <el-table-column label="角度" prop="0">
                        </el-table-column>
                        <el-table-column label="数量" prop="1">
                        </el-table-column>
                      </el-table-column>
                    </el-table>
                  </el-col>
                  <el-col :span="8">
                    <el-table
                      :height="this.tableHeight"
                      stripe
                      class="table dip-table"
                      :data="this.avgData.dip"
                    >
                      <el-table-column
                        label="倾角均值"
                        :width="this.tableWidth"
                      >
                        <el-table-column label="角度" prop="0">
                        </el-table-column>
                        <el-table-column label="数量" prop="1">
                        </el-table-column>
                      </el-table-column>
                    </el-table>
                  </el-col>
                </el-row>
              </el-card>
            </el-col>
            <el-col :span="12">
              <div
                id="strikeChart"
                ref="strikeChart"
                style="height: 500px; width: 100%"
              ></div>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import * as echarts from "echarts";
// import {} from "element-plus";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  components: [],
  data() {
    return {
      colWidth: 100,
      tableHeight: 400,
      /* {
        strike:102,//走向
        dip:'2'//倾角
      } */
      tableData: [],
      avgData: {
        strike: [],
        dip: [],
      },
      echart: undefined,
    };
  },
  watch: {
    tableData() {
      console.log("tableData");
      console.time("avgData");
      let _strikes = this.tableData.map((v) => v.strike).sort();
      let _dips = this.tableData.map((v) => v.dip).sort();

      this.avgData.strike = this.getAvgData(_strikes, "strike");
      this.avgData.dip = this.getAvgData(_dips, "dip");
      console.timeEnd("avgData");
    },
  },
  computed: {
    tableWidth() {
      return this.colWidth * 2;
    },
    canRender() {
      return !this.tableData.length > 0;
    },
  },
  methods: {
    getAvgData(arr) {
      // let avgData={};
      let data = [];
      console.log("getAvgData");
      for (let i = 0; i < 36; i++) {
        let sum = 0,
          count = 0;
        arr
          .filter((v) => Math.floor(v / 10) == i)
          .forEach((v) => {
            sum += v;
            count++;
          });
        if (count > 0) data.push([Number((sum / count).toFixed(2)), count]);
      }
      return data;
    },
    handleChange(upFile) {
      //载入CSV数据
      //1
      let file = new FileReader();
      file.readAsText(upFile.raw);
      file.onload = () => {
        let lines = file.result.split(/\r?\n/);
        let heads = lines.shift().split(",");
        let strike = heads.indexOf("strike"); //走向的index
        let dip = heads.indexOf("dip"); //倾角的index
        let csvData = [];
        lines.forEach((v) => {
          let item = v.split(",").map((w) => Number(w));
          csvData.push({
            strike: item[strike], //走向
            dip: item[dip], //倾角
          });
        });
        this.tableData = csvData;
      };
    },
    cellClick(row, col, cell, event) {
      console.log("row", row);
      console.log("col", col);
      console.log("cell", cell);
      cell.editable = true;
      console.log("event", event);
    },
    updateChart() {
      console.log('updateChart');
      this.initEchart(this.avgData.strike,this.avgData.dip);
    },
    renderItem(params, api, data) {
      // console.log('params.coordSys.r',params.coordSys.r,'params.coordSys.r0',params.coordSys.r0);
      if (
        Object.keys(params.context).indexOf("points") < 0 ||
        params.context.newPoints
      ) {
        params.context.points = [[params.coordSys.cx, params.coordSys.cy]];
        params.context.newPoints = false;
      }
      let index = params.dataIndexInside;
      let angle = api.value(0);
      let count = api.value(1);
      let xy = api.coord([count, angle]); //极坐标系下的（ρ，θ），笛卡尔坐标系下应该是（x，y）吧

      let continuous = // true:与下一个连续，false：与下一个不连续
        index + 1 < data.length
          ? Math.abs(
              Math.floor(data[index + 1][0] / 10) - Math.floor(angle / 10)
            ) < 2
          : false;
      // console.log('continuous',continuous,'data[index + 1][1]',data[index + 1][1],'angle',angle);
      // console.log('[xy[0], xy[1]]',[xy[0], xy[1]]);
      params.context.points.push([xy[0], xy[1]]);
      if (continuous) {
        return undefined;
      }
      // console.log("angle", angle);
      // console.log("count", count);
      // console.log("coord", xy);
      params.context.newPoints = true;
      // console.log("points", params.context.points);
      let polygon = {
        type: "polygon",
        shape: {
          points: [...params.context.points],
        },
        style: {
          fill: api.visual("color"),
          stroke: echarts.color.lift(api.visual("color"), 0.1),
        },
        transition: ["shape"],
      };
      return {
        type: "group",
        children: [polygon, ...this.genPoints(params.context.points, api)],
      };
    },
    genPoints(points, api) {
      points.shift();
      return points.map((v) => {
        return {
          type: "circle",
          shape: {
            cx: v[0],
            cy: v[1],
            r: 3,
          },
          focus: "self",
          style: {
            fill: api.visual("color"),
            stroke: echarts.color.lift(api.visual("color"), 0),
          },
        };
      });
    },
    initEchart(strikeData = [], dipData = []) {
      console.log("initEchart");
      if (this.echart == undefined)
        this.echart = echarts.init(this.$refs.strikeChart);
      strikeData.sort((a, b) => a[0] - b[0]);
      dipData.sort((a, b) => a[0] - b[0]);
      let that=this;
      let option = {
        title: [
          {
            text: "走向玫瑰图",
            left: "10%",
          },
          {
            text: "倾角玫瑰花图",
            right: "10%",
          },
        ],
        // dataZoom: [
        //   {
        //     type: "inside",
        //     filterMode: "empty",
        //     angleAxisIndex: 0,
        //   },
        //   {
        //     type: "slider",
        //     filterMode: "empty",
        //     radiusAxisIndex: 0,
        //     // right: "10%",
        //     startValue: 0,
        //     showDataShadow: true,
        //     orient: "vertical",
        //     minSpan: 0,
        //     minValueSpan: 0,
        //     labelPrecision: 0,
        //     labelFormatter: "{value}个" /* (value){
        //       return value+'个'
        //     } */,
        //   },
        // ],
        tooltip: {
          trigger: "axis",
          confine: true,
          // formatter:'{c}',
        },
        radiusAxis: [
          {
            type: "value",
            polarIndex:0,
            // name: "半径",
            min: 0,
            max: "dataMax",
          },
          {
            type: "value",
            polarIndex:1,
            // name: "半径",
            min: 0,
            max: "dataMax",
          },
        ],
        // axisLine: {
        //   show: false,
        // },
        // axisLabel: {
        //   show: false,
        // },
        // axisTick: {
        //   show: false,
        // },
        // splitLine: {
        //   show: false,
        // },
        angleAxis: [
          {
            type: "value",
            name: "角度",
            min: 0,
            max: 360,
            polarIndex:0,
            axisLabel: {
              formatter: "{value}°",
            },
            splitLine: {
              show: false,
            },
          },
          {
            type: "value",
            name: "角度",
            min: 0,
            max: 360,
            polarIndex:1,
            axisLabel: {
              formatter: "{value}°",
            },
            splitLine: {
              show: false,
            },
          },
        ],
        axisLine: {
          show: true,
        },
        polar: [
          {
            center: ["25%", "50%"],
            radius: "40%",
          },
          {
            center: ["75%", "50%"],
            radius: "40%",
          },
        ],
        series: [
          {
            type: "custom",
            renderItem(p, a) {
              return that.renderItem(p, a, strikeData);
            },
            coordinateSystem: "polar",
            itemStyle: {
              opacity: 0.8,
            },
            encode: {
              radius: 1,
              angle: 0,
            },
            data: strikeData,
            clip: true,
            center: ["30%", "50%"],
            radius: "40%",
            left: 0,
            top: 0,
            polarIndex: 0,
          },
          {
            type: "custom",
            renderItem(p, a) {
              return that.renderItem(p, a, dipData);
            },
            coordinateSystem: "polar",
            itemStyle: {
              opacity: 0.8,
            },
            encode: {
              radius: 1,
              angle: 0,
            },
            data: dipData,
            clip: true,
            center: ["60%", "50%"],
            radius: "40%",
            right: 0,
            top: 0,
            polarIndex: 1,
          },
        ],
      };
      this.echart.setOption(option);
    },
  },
  mounted() {
    this.initEchart();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#header {
  font-size: var(--el-font-size-extra-large);
  line-height: var(--el-header-height);
}
.tips {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  height: 100%;
}
.left-card {
}
.table {
  // width: 200px;
  min-width: 160px;
}
</style>
