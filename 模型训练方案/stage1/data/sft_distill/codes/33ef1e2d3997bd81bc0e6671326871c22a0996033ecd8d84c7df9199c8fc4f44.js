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
  // 使用 Graphics 绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillCircle(50, 50, 50); // 在中心绘制半径为50的圆
  
  // 生成纹理
  graphics.generateTexture('orangeCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象，放置在屏幕中央
  const circle = this.add.sprite(400, 300, 'orangeCircle');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: circle,
    alpha: 0, // 目标透明度为 0（完全透明）
    duration: 1250, // 单程时长 1.25 秒
    yoyo: true, // 启用 yoyo 效果，动画会反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 500, '橙色圆形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);