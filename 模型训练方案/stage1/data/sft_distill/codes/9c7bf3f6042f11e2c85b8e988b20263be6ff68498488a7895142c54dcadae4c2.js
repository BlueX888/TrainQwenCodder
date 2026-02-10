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
  // 创建 Graphics 对象绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制椭圆（中心点在 0,0，宽度 200，高度 120）
  graphics.fillEllipse(0, 0, 200, 120);
  
  // 将 graphics 移动到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.48,        // 缩放到 48%
    scaleY: 0.48,        // 缩放到 48%
    duration: 2000,      // 持续 2 秒
    ease: 'Sine.easeInOut', // 使用平滑的缓动函数
    yoyo: true,          // 动画结束后反向播放（恢复原始大小）
    loop: -1,            // 无限循环（-1 表示永久循环）
    repeat: 0            // repeat 与 yoyo 配合，0 表示每次循环执行一次 yoyo
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '椭圆缩放动画（2秒循环）', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);