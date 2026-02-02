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
  // 使用 Graphics 绘制黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 150, 100);
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 150, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象
  const rect = this.add.sprite(400, 300, 'yellowRect');
  
  // 创建淡入淡出动画
  // alpha 从 1 到 0（淡出），然后 yoyo 会自动从 0 到 1（淡入）
  this.tweens.add({
    targets: rect,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 1000,     // 动画持续时间 1 秒（1000 毫秒）
    yoyo: true,         // 启用 yoyo 效果，动画结束后反向播放
    repeat: -1,         // -1 表示无限循环
    ease: 'Linear'      // 线性缓动，保持匀速变化
  });
}

new Phaser.Game(config);