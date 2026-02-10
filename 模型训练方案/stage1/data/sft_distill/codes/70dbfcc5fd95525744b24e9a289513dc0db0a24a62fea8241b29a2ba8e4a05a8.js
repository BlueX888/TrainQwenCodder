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
  // 使用 Graphics 绘制蓝色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  graphics.fillRect(0, 0, 60, 60); // 60x60 的矩形
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('blueRect', 60, 60);
  graphics.destroy(); // 销毁 Graphics 对象，只保留纹理
  
  // 创建 Sprite 对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'blueRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧位置）
    duration: 4000,          // 持续时间 4 秒
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动函数，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Blue Rectangle Loop Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);