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
  // 方法1: 使用 Ellipse 游戏对象创建青色椭圆
  const ellipse = this.add.ellipse(400, 300, 200, 120, 0x00ffff);
  
  // 创建闪烁动画
  // 使用 alpha 透明度从 1 -> 0 -> 1 实现闪烁效果
  this.tweens.add({
    targets: ellipse,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 1000,     // 单程动画时间 1 秒
    yoyo: true,         // 启用 yoyo 模式，动画会反向播放回到初始值
    repeat: -1,         // -1 表示无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 500, '青色椭圆闪烁动画 (2秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);