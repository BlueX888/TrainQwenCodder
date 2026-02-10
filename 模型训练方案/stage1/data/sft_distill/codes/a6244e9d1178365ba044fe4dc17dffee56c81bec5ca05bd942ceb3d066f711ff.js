// 完整的 Phaser3 星形旋转代码
const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
const rotationSpeed = 200; // 每秒旋转200度

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius, rotation)
  graphics.fillStar(400, 300, 5, 30, 60, 0);
  
  // 保存 graphics 对象的引用以便在 update 中使用
  star = graphics;
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 将角速度从度/秒转换为弧度/毫秒
  const rotationIncrement = (rotationSpeed * Math.PI / 180) * (delta / 1000);
  
  // 更新星形的旋转角度
  star.rotation += rotationIncrement;
}

// 启动游戏
new Phaser.Game(config);