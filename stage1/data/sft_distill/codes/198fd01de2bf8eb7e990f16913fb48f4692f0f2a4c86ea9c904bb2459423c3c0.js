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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('greenRect', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象并设置到屏幕中心
  const rect = this.add.sprite(400, 300, 'greenRect');
  
  // 设置旋转中心点为矩形中心
  rect.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    rotation: Math.PI * 2,   // 旋转到 360 度（2π 弧度）
    duration: 1500,          // 动画时长 1.5 秒
    ease: 'Linear',          // 线性缓动，保持匀速旋转
    repeat: -1,              // -1 表示无限循环
    yoyo: false              // 不需要来回播放
  });
}

new Phaser.Game(config);