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

let rectangle;
const rotationSpeed = 200; // 每秒旋转200度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  rectangle = this.add.graphics();
  
  // 设置填充颜色为红色
  rectangle.fillStyle(0xff0000, 1);
  
  // 绘制一个矩形（以中心点为原点，方便旋转）
  // 矩形宽100，高60，中心点在(0, 0)
  rectangle.fillRect(-50, -30, 100, 60);
  
  // 将矩形移动到画布中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 添加边框以便更清楚地看到旋转效果
  rectangle.lineStyle(2, 0xffffff, 1);
  rectangle.strokeRect(-50, -30, 100, 60);
}

function update(time, delta) {
  // delta 是自上一帧以来经过的毫秒数
  // 将每秒200度转换为每毫秒的弧度增量
  // 200度 = 200 * (Math.PI / 180) 弧度
  // delta 是毫秒，所以需要除以1000转换为秒
  const rotationIncrement = (rotationSpeed * Math.PI / 180) * (delta / 1000);
  
  // 累加旋转角度
  rectangle.rotation += rotationIncrement;
}

new Phaser.Game(config);