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
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制圆形（中心点在 0,0，半径 50）
  graphics.fillCircle(0, 0, 50);
  
  // 将圆形放置在屏幕中央
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.16,               // X 轴缩放到 16%
    scaleY: 0.16,               // Y 轴缩放到 16%
    duration: 1500,             // 动画持续时间 1.5 秒
    yoyo: true,                 // 启用悠悠球效果（动画结束后反向播放回到初始状态）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'      // 缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Circle scaling animation (1.5s to 16% and back, looping)', {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);