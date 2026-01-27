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
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制星形（中心点、5个角、外半径、内半径）
  // 将星形绘制在中心位置以便后续使用
  graphics.fillStar(50, 50, 5, 40, 20, 0);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用星形纹理的精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'starTexture');
  
  // 创建补间动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 2500,          // 持续时间 2.5 秒
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动函数，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '红色星形左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);