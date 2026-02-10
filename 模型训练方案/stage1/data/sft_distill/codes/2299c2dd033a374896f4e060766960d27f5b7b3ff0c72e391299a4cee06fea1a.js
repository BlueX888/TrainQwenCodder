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
  // 方法1: 使用 Rectangle 游戏对象（推荐）
  const rectangle = this.add.rectangle(400, 300, 200, 150, 0xff8800);
  
  // 创建淡入淡出动画
  // alpha 从 1 变到 0（淡出），然后 yoyo 会自动从 0 变回 1（淡入）
  this.tweens.add({
    targets: rectangle,           // 动画目标对象
    alpha: 0,                     // 目标 alpha 值（从当前的 1 变到 0）
    duration: 500,                // 单程持续时间 500ms
    yoyo: true,                   // 启用 yoyo 效果，动画会反向播放（淡入）
    repeat: -1,                   // 无限循环 (-1 表示永远重复)
    ease: 'Linear'                // 线性缓动
  });
  
  // 添加说明文字
  this.add.text(400, 500, '橙色矩形淡入淡出循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);