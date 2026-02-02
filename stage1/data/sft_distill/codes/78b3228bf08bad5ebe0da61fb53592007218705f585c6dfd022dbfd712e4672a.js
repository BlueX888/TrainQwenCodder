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
  // 使用 Graphics 绘制蓝色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(25, 25, 25); // 在中心位置绘制半径为25的圆形
  
  // 生成纹理
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'blueCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    x: 700,                    // 目标 x 坐标（从左侧100移动到右侧700）
    duration: 500,             // 动画时长 0.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    loop: -1                   // 无限循环（-1 表示永久循环）
  });
  
  // 添加提示文本
  this.add.text(10, 10, '蓝色圆形左右往返循环移动', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

// 启动游戏
new Phaser.Game(config);