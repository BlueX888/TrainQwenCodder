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
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  
  // 设置白色填充
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制星形（中心点在 50, 50，外半径 50，内半径 25，5个角）
  graphics.fillStar(50, 50, 5, 25, 50, 0);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建星形精灵，初始位置在屏幕左侧
  const star = this.add.sprite(100, 300, 'starTexture');
  
  // 创建补间动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（屏幕右侧）
    duration: 2000,          // 持续时间 2 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    repeat: -1               // 无限循环（-1 表示永远重复）
  });
  
  // 添加说明文字
  this.add.text(400, 50, '星形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);