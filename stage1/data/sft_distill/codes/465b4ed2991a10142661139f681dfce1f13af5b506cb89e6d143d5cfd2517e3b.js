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
  // 使用 Graphics 生成蓝色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 设置蓝色填充
  graphics.fillStyle(0x0088ff, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 顶点
  graphics.lineTo(0, 52);      // 左下角
  graphics.lineTo(60, 52);     // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('blueTriangle', 60, 52);
  
  // 清理 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'blueTriangle');
  
  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 1000,            // 持续时间 1 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    onLoop: function() {
      // 可选：每次循环时的回调
      console.log('Triangle loop completed');
    }
  });
  
  // 添加说明文字
  this.add.text(400, 50, 'Blue Triangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The triangle moves left-right in a loop (1 second each way)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);