const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
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
  const circle = this.add.sprite(400, 100, 'blueCircle');
  
  // 添加地面参考线（可选，用于视觉效果）
  const groundY = 500;
  const ground = this.add.graphics();
  ground.lineStyle(2, 0x666666, 1);
  ground.lineBetween(0, groundY, 800, groundY);
  
  // 创建弹跳动画
  this.tweens.add({
    targets: circle,
    y: groundY - 25, // 落到地面位置（减去圆形半径）
    duration: 2000, // 2秒完成一次弹跳
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: false, // 不使用 yoyo，因为弹跳效果本身已经包含回弹
    repeat: -1, // 无限循环
    onRepeat: () => {
      // 每次重复时重置到起始位置
      circle.y = 100;
    }
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Bouncing Circle Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);