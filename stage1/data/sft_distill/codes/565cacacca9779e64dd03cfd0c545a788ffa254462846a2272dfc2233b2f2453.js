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
  // 使用 Graphics 绘制橙色三角形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (0, 0)，方便后续定位
  const triangleHeight = 60;
  const triangleBase = 52;
  
  graphics.beginPath();
  graphics.moveTo(0, -triangleHeight / 2);  // 顶点
  graphics.lineTo(-triangleBase / 2, triangleHeight / 2);  // 左下角
  graphics.lineTo(triangleBase / 2, triangleHeight / 2);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('orangeTriangle', triangleBase, triangleHeight);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'orangeTriangle');
  
  // 创建补间动画
  this.tweens.add({
    targets: triangle,
    x: 700,  // 移动到右侧
    duration: 2500,  // 2.5秒
    ease: 'Linear',  // 线性运动
    yoyo: true,  // 往返效果
    loop: -1  // 无限循环
  });
}

// 启动游戏
new Phaser.Game(config);