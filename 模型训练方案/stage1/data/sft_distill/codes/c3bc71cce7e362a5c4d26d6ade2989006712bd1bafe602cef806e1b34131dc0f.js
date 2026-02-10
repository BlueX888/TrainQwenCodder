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
  // 创建粉色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（使用 beginPath 和 fillPath）
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 顶点
  graphics.lineTo(60, 50);     // 右下角
  graphics.lineTo(0, 50);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 500,               // 持续时间 0.5 秒
    yoyo: true,                  // 启用往返效果（到达终点后反向播放）
    loop: -1,                    // 无限循环（-1 表示永久循环）
    ease: 'Linear'               // 线性缓动函数，保持匀速运动
  });
}

new Phaser.Game(config);