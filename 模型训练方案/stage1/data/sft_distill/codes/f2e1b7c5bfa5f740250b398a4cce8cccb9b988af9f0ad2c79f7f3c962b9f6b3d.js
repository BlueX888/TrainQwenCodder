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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制星形
  star = this.add.graphics();
  
  // 设置填充颜色为黄色
  star.fillStyle(0xffff00, 1);
  
  // 绘制星形：中心点(400, 300)，5个角，外半径100，内半径50
  star.fillStar(400, 300, 5, 100, 50);
  
  // 设置旋转中心点为星形的中心
  star.setPosition(0, 0);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 每秒旋转 200 度 = 200 度/秒
  // 转换为弧度：200 * (Math.PI / 180) = 3.49 弧度/秒
  
  // 计算本帧应该旋转的角度（弧度）
  const rotationSpeed = 200 * (Math.PI / 180); // 每秒旋转的弧度数
  const rotationDelta = rotationSpeed * (delta / 1000); // 本帧旋转的弧度数
  
  // 累加旋转角度
  star.rotation += rotationDelta;
}

new Phaser.Game(config);