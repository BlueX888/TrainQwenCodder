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
const MAX_TRIANGLES = 20;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化计数器
  triangleCount = 0;

  // 创建定时器事件，每 1.5 秒触发一次
  this.time.addEvent({
    delay: 1500,                    // 1.5 秒
    callback: spawnTriangle,        // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true,                     // 循环执行
    repeat: MAX_TRIANGLES - 1       // 重复 19 次（加上第一次共 20 次）
  });

  // 添加文本提示
  this.add.text(10, 10, 'Triangles: 0 / 20', {
    fontSize: '20px',
    color: '#ffffff'
  }).setDepth(1000);
}

function spawnTriangle() {
  if (triangleCount >= MAX_TRIANGLES) {
    return;
  }

  // 生成随机位置
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);

  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色 (cyan)
  
  // 绘制三角形（等边三角形）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(x, y - size);                    // 顶点
  graphics.lineTo(x - size, y + size);             // 左下角
  graphics.lineTo(x + size, y + size);             // 右下角
  graphics.closePath();
  graphics.fillPath();

  // 增加计数
  triangleCount++;

  // 更新文本显示
  const textObj = this.children.list.find(obj => obj.type === 'Text');
  if (textObj) {
    textObj.setText(`Triangles: ${triangleCount} / ${MAX_TRIANGLES}`);
  }

  // 添加简单的缩放动画效果
  graphics.setScale(0);
  this.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  console.log(`生成第 ${triangleCount} 个三角形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);