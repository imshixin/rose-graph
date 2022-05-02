<!--
 * @Author: imsixn
 * @Date: 2022-04-26 10:16:40
 * @LastEditors: imsixn
 * @LastEditTime: 2022-05-02 11:33:37
 * @Description: file content
-->
<template>
  <div class="common-layout">
    <el-container>
      <el-header id="header">玫瑰花图生成器</el-header>
      <el-container>
        <el-main>
          <el-card>
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
            <el-row>
              <el-col :span="8">
                <el-table
                  :data="tableData"
                  stripe
                  border
                  height="420"
                  class="main-table"
                  @cell-click="cellClick"
                >
                  <el-table-column prop="strike" label="走向">
                  </el-table-column>
                  <el-table-column prop="dip" label="倾角"> </el-table-column>
                </el-table>
              </el-col>
              <el-col :span="8">
                <el-table
                  height="420"
                  stripe
                  style="width: 320px"
                  :data="this.avgData.strike"
                >
                  <el-table-column label="走向均值" width="320">
                    <el-table-column label="角度" width="160" prop="0">
                    </el-table-column>
                    <el-table-column label="数量" width="160" prop="1">
                    </el-table-column>
                  </el-table-column>
                </el-table>
              </el-col>
              <el-col :span="8">
                <el-table
                  height="420"
                  stripe
                  style="width: 320px"
                  :data="this.avgData.dip"
                >
                  <el-table-column label="倾角均值" width="320">
                    <el-table-column label="角度" width="160" prop="0">
                    </el-table-column>
                    <el-table-column label="数量" width="160" prop="1">
                    </el-table-column>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-card>
          <div
            id="echarts"
            ref="echarts"
            style="height: 500px; width: 500px"
          ></div>
        </el-main>
        <el-aside width="200px"> </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import * as echarts from "echarts";
import {} from "element-plus";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  components: [],
  data() {
    return {
      tableData: [],
      avgData: {
        strike: [],
        dip: [],
      },
      /* {
        strike:102,//走向
        dip:'2'//倾角
      } */
      strikeChart: undefined,
    };
  },
  watch: {
    tableData() {
      console.time("avgData");
      let _strikes = this.tableData.map((v) => v.strike).sort();
      let _dips = this.tableData.map((v) => v.dip).sort();

      this.avgData = {
        strike: this.getAvgData(_strikes, "strike"),
        dip: this.getAvgData(_dips, "dip"),
      };
      console.timeEnd("avgData");
    },
  },
  computed: {
    canRender() {
      return !this.tableData.length > 0;
    },
  },
  methods: {
    getAvgData(arr) {
      // let avgData={};
      let data = [];
      // console.log("111");
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
      this.initEchart(this.avgData.strike);
    },
    sort(list, func = (a, b) => a - b) {
      let arr = Array.from(list);
      let temp,
        swap = true;
      for (let i = 0; i < arr.length; i++) {
        swap = false;
        for (let j = i + 1; j < arr.length; j++) {
          console.log(!func(arr[i], arr[j]));
          if (func(arr[i], arr[j]) < 0) {
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            swap = true;
          }
        }
        //如果该轮一次也没交换过，说明已经排好了，break
        if (!swap) {
          break;
        }
      }
      return arr;
    },
    initEchart(data) {
      this.strikeChart = echarts.init(this.$refs.echarts);
      // let data = this.sort(_data,(a));
      data.sort((a, b) => a[0] - b[0]);
      // console.log('data111111111',data);
      function genPoints(points, api) {
        return points.map((v) => {
          return {
            type: "circle",
            shape: {
              cx: v[0],
              cy: v[1],
              r: 1,
            },
            focus: "self",
            style: {
              fill: api.visual("color"),
              stroke: echarts.color.lift("#ffbc60", 0),
            },
          };
        });
      }
      function renderItem(params, api) {
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
          children: [polygon, ...genPoints(params.context.points, api)],
        };
      }
      let option = {
        dataZoom: [
          {
            type: "inside",
            filterMode: "empty",
            angleAxisIndex: 0,
          },
          {
            type: "slider",
            filterMode: "empty",
            radiusAxisIndex: 0,
            right: "10%",
            startValue: 0,
            showDataShadow: true,
            orient: "vertical",
            minSpan: 0,
            minValueSpan: 0,
            labelPrecision: 0,
            labelFormatter: "{value}个" /* (value){
              return value+'个'
            } */,
          },
        ],
        tooltip: {
          trigger: "axis",
          confine: true,
          // formatter:'{c}',
          axisPointer: {
            type: "shadow",
            snap: false,
            shadowStyle: {
              color: "rgba(5,5,5,.5)",
            },
          },
        },
        radiusAxis: {
          type: "value",
          name: "半径",
          min: 0,
          max: "dataMax",
          axisLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          // minInterval: 1,
          // splitNumber: 5,
          // boundryGap: false,
        },
        angleAxis: {
          type: "value",
          name: "角度",
          // boundaryGap: ["20%", "20%"],
          // interval:30,
          min: 0,
          max: 360,
          splitLine: {
            show: false,
          },
        },
        axisLine: {
          show: true,
        },
        polar: {
          center: ["50%", "50%"],
          radius: "80%",
        },
        series: [
          {
            type: "custom",
            renderItem: renderItem,
            coordinateSystem: "polar",
            itemStyle: {
              opacity: 0.8,
            },
            encode: {
              radius: 1,
              angle: 0,
            },
            data: data,
            clip: true,
          },
        ],
      };
      this.strikeChart.setOption(option);
    },
  },
  mounted() {
    // this.tableData
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#header {
  font-size: var(--el-font-size-extra-large);
}
.tips {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  height: 100%;
}
.main-table {
  width: 320px;
}
</style>
