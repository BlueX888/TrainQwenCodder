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

let diamondCount = 0;
const MAX_DIAMONDS = 10;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 立即生成第一个菱形
  createDiamond.call(this);
  diamondCount++;

  // 创建定时器，每 4 秒生成一个菱形
  // repeat 设置为 9，加上初始的 1 个，总共 10 个
  this.time.addEvent({
    delay: 4000,                    // 4 秒间隔
    callback: createDiamond,        // 回调函数
    callbackScope: this,            // 回调作用域
    repeat: MAX_DIAMONDS - 1,       // 重复 9 次（已生成 1 个，还需 9 个）
    loop: false                     // 不循环
  });

  // 添加文本显示当前菱形数量
  this.diamondText = this.add.text(10, 10, `菱形数量: ${diamondCount}/${MAX_DIAMONDS}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function createDiamond() {
  // 生成随机位置
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 菱形大小
  const size = 30;
  
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形（四个顶点：上、右、下、左）
  const points = [
    x, y - size,           // 上顶点
    x + size, y,           // 右顶点
    x, y + size,           // 下顶点
    x - size, y            // 左顶点
  ];
  
  graphics.fillPoints(points, true);
  
  // 更新计数
  diamondCount++;
  
  // 更新文本显示
  if (this.diamondText) {
    this.diamondText.setText(`菱形数量: ${diamondCount}/${MAX_DIAMONDS}`);
  }
  
  // 添加简单的缩放动画效果
  graphics.setScale(0);
  this.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
}

new Phaser.Game(config);