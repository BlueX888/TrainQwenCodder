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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（使用四个点连接）
  const size = 100;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 顶点
  graphics.lineTo(size, 0);       // 右点
  graphics.lineTo(0, size);       // 底点
  graphics.lineTo(-size, 0);      // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵并居中
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  // 从原始大小(1) -> 缩小到16%(0.16) -> 恢复到原始大小(1)
  this.tweens.add({
    targets: diamond,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 1250,  // 2.5秒的一半
    yoyo: true,      // 启用 yoyo 效果，自动返回初始值
    repeat: -1,      // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 50, '菱形缩放动画\n2.5秒循环', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);