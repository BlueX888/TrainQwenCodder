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
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为灰色
  graphics.fillStyle(0x808080, 1);
  
  // 绘制三角形（使用 beginPath 和 fillTriangle）
  // 三角形中心点在 (0, 0)，方便后续定位
  graphics.fillTriangle(
    0, -30,    // 顶点
    -25, 30,   // 左下角
    25, 30     // 右下角
  );
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', 50, 60);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用该纹理的 Sprite，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左移动到右
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 2000,              // 持续时间 2 秒
    yoyo: true,                  // 启用往返效果（到达终点后反向播放）
    loop: -1,                    // 无限循环（-1 表示永久循环）
    ease: 'Linear'               // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);