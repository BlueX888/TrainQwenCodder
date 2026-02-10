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
  // 创建粉色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（旋转45度的正方形）
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在屏幕中上方
  const diamond = this.add.sprite(400, 200, 'diamond');
  
  // 设置原点为中心
  diamond.setOrigin(0.5, 0.5);
  
  // 创建弹跳动画
  // 使用 Bounce.easeOut 模拟真实的弹跳效果
  this.tweens.add({
    targets: diamond,
    y: 400, // 弹跳到的目标位置
    duration: 750, // 下落时间 0.75秒
    ease: 'Bounce.easeOut', // 弹跳缓动
    yoyo: true, // 来回运动
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });
  
  // 添加轻微的缩放效果增强弹跳感
  this.tweens.add({
    targets: diamond,
    scaleX: 1.1,
    scaleY: 0.9,
    duration: 750,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
  
  // 添加提示文字
  this.add.text(400, 550, '粉色菱形弹跳动画 (1.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);