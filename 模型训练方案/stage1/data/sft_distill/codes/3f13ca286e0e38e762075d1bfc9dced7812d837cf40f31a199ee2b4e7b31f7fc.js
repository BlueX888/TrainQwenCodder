const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(50, 50, 50); // 半径 50 的圆形
  
  // 生成纹理
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();
  
  // 创建 Sprite
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建抖动动画
  // 使用多个 tween 组合实现抖动效果
  this.tweens.add({
    targets: circle,
    x: '+=10', // 向右偏移
    y: '+=8',  // 向下偏移
    duration: 50,
    yoyo: true,
    repeat: -1, // 无限重复
    repeatDelay: 0
  });
  
  // 添加另一个方向的抖动
  this.tweens.add({
    targets: circle,
    x: '-=8',
    y: '+=10',
    duration: 70,
    yoyo: true,
    repeat: -1,
    repeatDelay: 0
  });
  
  // 添加旋转抖动
  this.tweens.add({
    targets: circle,
    angle: 5,
    duration: 100,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 主控制 tween，控制整体 3 秒循环
  this.tweens.add({
    targets: circle,
    scale: 1.05,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 添加提示文字
  this.add.text(400, 500, '抖动动画循环中...', {
    fontSize: '24px',
    color: '#00ffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);