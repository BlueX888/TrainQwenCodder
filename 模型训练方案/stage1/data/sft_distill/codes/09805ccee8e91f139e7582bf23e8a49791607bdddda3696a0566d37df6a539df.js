const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0088ff, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建蓝色圆形精灵
  const circle = this.add.sprite(400, 200, 'blueCircle');
  
  // 添加地面参考线（可选，用于视觉效果）
  const ground = this.add.graphics();
  ground.lineStyle(2, 0xffffff, 0.3);
  ground.lineBetween(0, 500, 800, 500);
  
  // 创建弹跳动画
  // 使用 yoyo 实现上升和下降，配合 Bounce.easeOut 实现弹跳效果
  this.tweens.add({
    targets: circle,
    y: 475, // 弹跳到地面位置（500 - 圆形半径25）
    duration: 1000, // 下落时间1秒
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 往返运动
    repeat: -1, // 无限循环
    hold: 0, // 到达底部后立即返回
    repeatDelay: 0 // 循环之间无延迟
  });
  
  // 添加说明文字
  this.add.text(400, 50, '弹跳动画循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '2秒完成一次完整弹跳循环', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
}

new Phaser.Game(config);