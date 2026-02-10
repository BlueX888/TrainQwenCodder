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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('purpleRect', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建 Sprite 并设置位置到屏幕中心
  const rect = this.add.sprite(400, 300, 'purpleRect');
  
  // 设置旋转中心点（默认已经是中心，这里显式说明）
  rect.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: rect,           // 目标对象
    rotation: Math.PI * 2,   // 旋转到 360 度（2π 弧度）
    duration: 2000,          // 持续 2 秒
    ease: 'Linear',          // 线性缓动，匀速旋转
    loop: -1,                // -1 表示无限循环
    repeat: 0                // repeat 为 0，使用 loop 控制循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Purple Rectangle Rotating', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);