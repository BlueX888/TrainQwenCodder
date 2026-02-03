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
  // 使用 Graphics 绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillCircle(50, 50, 50); // 圆心(50,50)，半径50
  
  // 生成纹理
  graphics.generateTexture('orangeCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，节省资源
  
  // 在屏幕中心创建 Sprite
  const circle = this.add.sprite(400, 300, 'orangeCircle');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: circle,
    alpha: 0, // 目标透明度为0（完全透明）
    duration: 1250, // 单程持续时间1.25秒
    yoyo: true, // 启用yoyo效果，动画会反向播放（淡入）
    repeat: -1, // -1表示无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动函数，使动画更平滑
  });
}

new Phaser.Game(config);