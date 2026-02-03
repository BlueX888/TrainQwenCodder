// Phaser3 补间动画示例：青色矩形左右往返循环
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
  // 创建 Graphics 对象绘制青色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 60, 60); // 绘制 60x60 的矩形
  
  // 生成纹理供 Sprite 使用
  graphics.generateTexture('cyanRect', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用该纹理的精灵
  const rect = this.add.sprite(100, 300, 'cyanRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（从左移到右）
    duration: 2500,          // 持续时间 2.5 秒
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动函数，匀速移动
  });
  
  // 添加提示文字
  this.add.text(300, 50, 'Cyan Rectangle Tween Loop', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

// 启动 Phaser 游戏
new Phaser.Game(config);