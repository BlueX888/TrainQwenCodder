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

let square;
const rotationSpeed = 300; // 度/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建一个 Graphics 对象绘制方块
  square = this.add.graphics();
  
  // 设置填充颜色为蓝色
  square.fillStyle(0x3498db, 1);
  
  // 绘制一个 100x100 的方块，中心点在 (0, 0)
  // 这样旋转时会围绕中心旋转
  square.fillRect(-50, -50, 100, 100);
  
  // 将方块放置在画布中心
  square.x = 400;
  square.y = 300;
}

function update(time, delta) {
  // 将旋转速度从度/秒转换为弧度/秒
  const rotationSpeedRad = Phaser.Math.DegToRad(rotationSpeed);
  
  // 根据 delta 时间（毫秒）计算本帧应旋转的角度
  // delta 是毫秒，需要除以 1000 转换为秒
  const rotationThisFrame = rotationSpeedRad * (delta / 1000);
  
  // 累加旋转角度
  square.rotation += rotationThisFrame;
}

new Phaser.Game(config);