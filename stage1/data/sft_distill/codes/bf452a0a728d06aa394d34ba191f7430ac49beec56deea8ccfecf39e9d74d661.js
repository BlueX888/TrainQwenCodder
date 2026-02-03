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
  // 使用 Graphics 绘制红色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -50);      // 顶点
  graphics.lineTo(-43, 25);     // 左下角
  graphics.lineTo(43, 25);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('triangle', 86, 75);
  graphics.destroy(); // 销毁 Graphics 对象，节省资源
  
  // 创建使用三角形纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现从 0 到 1 再回到 0 的效果
  this.tweens.add({
    targets: triangle,
    alpha: { from: 0, to: 1 },  // 从完全透明到完全不透明
    duration: 1250,              // 单程时间 1.25 秒
    yoyo: true,                  // 返回起点（淡出）
    repeat: -1,                  // 无限循环
    ease: 'Sine.easeInOut'       // 平滑的缓动效果
  });
  
  // 添加说明文字
  this.add.text(400, 500, '红色三角形淡入淡出循环动画 (2.5秒/周期)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);