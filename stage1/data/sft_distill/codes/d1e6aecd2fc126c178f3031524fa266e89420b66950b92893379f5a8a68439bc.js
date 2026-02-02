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
  // 使用 Graphics 绘制绿色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('greenRect', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建 Sprite 对象并设置位置到屏幕中心
  const rect = this.add.sprite(400, 300, 'greenRect');
  
  // 设置旋转中心点为矩形中心
  rect.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    rotation: Math.PI * 2,   // 旋转角度：2π 弧度 = 360 度
    duration: 1500,          // 动画时长：1.5 秒
    ease: 'Linear',          // 线性缓动，匀速旋转
    repeat: -1               // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 500, '绿色矩形旋转动画 (1.5秒/圈)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);