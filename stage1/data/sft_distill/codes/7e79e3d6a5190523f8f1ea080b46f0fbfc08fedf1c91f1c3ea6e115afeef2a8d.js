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
  // 使用 Graphics 绘制圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成了纹理
  
  // 创建 Sprite 使用生成的圆形纹理
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 创建缩放动画
  // yoyo 模式：从 1 缩放到 0.24（2秒），再从 0.24 恢复到 1（2秒），总共 4 秒
  this.tweens.add({
    targets: circle,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 2000,      // 单程持续时间 2 秒
    yoyo: true,          // 启用 yoyo 效果，动画会反向播放回到初始值
    loop: -1,            // -1 表示无限循环
    ease: 'Linear'       // 线性缓动，匀速变化
  });
  
  // 添加文字说明
  this.add.text(400, 500, '圆形缩放动画：4秒循环（2秒缩小到24%，2秒恢复）', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);