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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（顶点朝上）
  const triangleSize = 60;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize / 2); // 顶点
  graphics.lineTo(-triangleSize / 2, triangleSize / 2); // 左下角
  graphics.lineTo(triangleSize / 2, triangleSize / 2); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize, triangleSize);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在屏幕中心偏上
  const triangle = this.add.sprite(400, 200, 'triangle');
  
  // 创建弹跳动画
  // 从当前位置（y=200）弹跳到底部（y=500），然后返回
  this.tweens.add({
    targets: triangle,
    y: 500, // 目标 y 位置
    duration: 1500, // 下落时间 1.5 秒
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 往返动画
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });
  
  // 添加文字说明
  this.add.text(400, 50, '绿色三角形弹跳动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '3秒一个循环（1.5秒下落 + 1.5秒上升）', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);