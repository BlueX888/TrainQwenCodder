const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x3498db, 1);
  graphics.fillCircle(32, 32, 32);
  graphics.generateTexture('blueCircle', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建蓝色圆形精灵
  const circle = this.add.sprite(400, 200, 'blueCircle');
  
  // 创建弹跳动画
  // 从 y=200 弹跳到 y=400，使用 Bounce.easeOut 缓动
  this.tweens.add({
    targets: circle,
    y: 400,                    // 目标 Y 坐标
    duration: 2000,            // 持续时间 2 秒
    ease: 'Bounce.easeOut',    // 弹跳缓动效果
    yoyo: true,                // 来回运动
    repeat: -1,                // 无限循环
    repeatDelay: 0             // 无延迟重复
  });
  
  // 添加说明文字
  this.add.text(400, 500, '蓝色圆形弹跳动画 (2秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);