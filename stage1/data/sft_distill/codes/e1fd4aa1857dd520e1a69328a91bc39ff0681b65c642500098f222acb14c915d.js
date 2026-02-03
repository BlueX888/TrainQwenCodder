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
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -50);      // 顶点
  graphics.lineTo(-43, 25);     // 左下
  graphics.lineTo(43, 25);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 86, 75);
  graphics.destroy();
  
  // 创建三角形精灵并居中显示
  const triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: triangle,
    alpha: 0,                    // 目标透明度
    duration: 1250,              // 单程时间 1.25 秒
    yoyo: true,                  // 往返效果（淡出后淡入）
    repeat: -1,                  // 无限循环
    ease: 'Sine.easeInOut'       // 缓动函数，使过渡更平滑
  });
  
  // 添加说明文字
  this.add.text(400, 500, '红色三角形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);