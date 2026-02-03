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
  // 使用 Graphics 创建绿色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制绿色三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 顶点
  graphics.lineTo(100, 100);   // 右下角
  graphics.lineTo(0, 100);     // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在屏幕中上方
  const triangle = this.add.sprite(400, 150, 'triangle');
  
  // 创建弹跳动画
  // 使用 yoyo 模式实现上下弹跳
  this.tweens.add({
    targets: triangle,
    y: 450,                    // 目标 y 坐标（下方位置）
    duration: 1500,            // 下落时间 1.5 秒
    ease: 'Bounce.easeOut',    // 弹跳缓动效果
    yoyo: true,                // 启用往返动画
    yoyoEase: 'Power2.easeIn', // 上升时的缓动效果
    repeat: -1,                // 无限循环
    repeatDelay: 0             // 无延迟
  });
  
  // 添加文字说明
  this.add.text(400, 30, '绿色三角形弹跳动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);