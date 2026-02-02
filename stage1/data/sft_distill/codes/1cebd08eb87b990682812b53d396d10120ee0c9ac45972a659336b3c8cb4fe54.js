const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
let rotationSpeed; // 每秒旋转的弧度数

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 计算旋转速度：120度/秒 转换为弧度/秒
  rotationSpeed = Phaser.Math.DegToRad(120);
  
  // 创建 Graphics 对象用于绘制星形
  star = this.add.graphics();
  
  // 设置星形的位置（通过设置 Graphics 对象的位置）
  star.x = 400;
  star.y = 300;
  
  // 设置填充颜色
  star.fillStyle(0xffff00, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius)
  // 由于我们已经设置了 Graphics 的 x, y，这里星形中心使用 (0, 0)
  star.fillStar(0, 0, 5, 40, 80);
  
  // 添加描边使星形更明显
  star.lineStyle(3, 0xffa500, 1);
  star.strokeStar(0, 0, 5, 40, 80);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度：当前角度 + 旋转速度 * 时间差
  star.rotation += rotationSpeed * deltaInSeconds;
  
  // 可选：将角度限制在 0-2π 范围内，避免数值过大
  if (star.rotation > Math.PI * 2) {
    star.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);