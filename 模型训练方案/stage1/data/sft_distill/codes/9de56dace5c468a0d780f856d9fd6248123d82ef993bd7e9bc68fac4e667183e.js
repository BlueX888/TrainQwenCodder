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
  // 使用 Graphics 绘制紫色三角形
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9933ff, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (30, 30)，方便后续定位
  graphics.beginPath();
  graphics.moveTo(30, 10);      // 顶点
  graphics.lineTo(10, 50);      // 左下角
  graphics.lineTo(50, 50);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 60);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: triangle,           // 动画目标
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 2000,              // 持续时间 2 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 启用往返（到达终点后反向播放）
    loop: -1                     // 无限循环（-1 表示永久循环）
  });
}

// 创建游戏实例
new Phaser.Game(config);