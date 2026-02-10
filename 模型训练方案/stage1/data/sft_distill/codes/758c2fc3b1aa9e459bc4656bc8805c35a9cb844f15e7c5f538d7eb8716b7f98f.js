const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('yellowRect', 200, 150);
  graphics.destroy();
}

function create() {
  // 创建黄色矩形精灵
  const rect = this.add.sprite(400, 300, 'yellowRect');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入后自动淡出
  // repeat: -1 实现无限循环
  this.tweens.add({
    targets: rect,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 1000,     // 动画时长 1 秒
    yoyo: true,         // 动画结束后反向播放（淡出后淡入）
    repeat: -1,         // 无限循环
    ease: 'Linear'      // 线性缓动
  });
}

new Phaser.Game(config);