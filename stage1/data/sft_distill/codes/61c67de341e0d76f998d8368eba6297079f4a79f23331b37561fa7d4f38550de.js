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

let triangleCount = 0;
const MAX_TRIANGLES = 15;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  triangleCount = 0;
  
  // 创建蓝色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制三角形路径
  graphics.beginPath();
  graphics.moveTo(0, -20);  // 顶点
  graphics.lineTo(-17, 20);  // 左下
  graphics.lineTo(17, 20);   // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('blueTriangle', 34, 40);
  graphics.destroy();
  
  // 添加标题文本
  this.add.text(10, 10, 'Blue Triangles Generator', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 添加计数显示文本
  const countText = this.add.text(10, 40, `Count: 0 / ${MAX_TRIANGLES}`, {
    fontSize: '18px',
    color: '#00ff00'
  });
  
  // 创建定时器事件，每4秒执行一次
  timerEvent = this.time.addEvent({
    delay: 4000,                // 4秒
    callback: spawnTriangle,    // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true,                 // 循环执行
    args: [countText]           // 传递参数
  });
  
  // 立即生成第一个三角形
  spawnTriangle.call(this, countText);
}

function spawnTriangle(countText) {
  // 检查是否达到最大数量
  if (triangleCount >= MAX_TRIANGLES) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成信息
    this.add.text(400, 300, 'All 15 triangles spawned!', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（留出边距，避免三角形超出边界）
  const margin = 30;
  const randomX = Phaser.Math.Between(margin, this.scale.width - margin);
  const randomY = Phaser.Math.Between(margin + 60, this.scale.height - margin);
  
  // 创建三角形图像
  const triangle = this.add.image(randomX, randomY, 'blueTriangle');
  
  // 添加生成动画效果
  triangle.setScale(0);
  this.tweens.add({
    targets: triangle,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  triangleCount++;
  
  // 更新计数文本
  countText.setText(`Count: ${triangleCount} / ${MAX_TRIANGLES}`);
  
  // 添加淡入效果
  triangle.setAlpha(0);
  this.tweens.add({
    targets: triangle,
    alpha: 1,
    duration: 500
  });
}

new Phaser.Game(config);