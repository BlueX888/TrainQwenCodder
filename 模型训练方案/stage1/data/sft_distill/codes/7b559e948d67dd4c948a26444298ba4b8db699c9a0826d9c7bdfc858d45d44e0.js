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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('squareTex', 100, 100);
  graphics.destroy();
  
  // 创建方块精灵并设置到屏幕中心
  square = this.add.sprite(400, 300, 'squareTex');
  
  // 设置旋转中心点为方块中心
  square.setOrigin(0.5, 0.5);
  
  // 添加提示文本
  this.add.text(10, 10, '方块以每秒 360° 的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 每秒旋转 360 度 = 2π 弧度
  // 每毫秒旋转的弧度 = (2 * Math.PI) / 1000
  // rotation 使用弧度制
  const rotationSpeed = (2 * Math.PI) / 1000; // 每毫秒旋转的弧度
  square.rotation += rotationSpeed * delta;
}

new Phaser.Game(config);