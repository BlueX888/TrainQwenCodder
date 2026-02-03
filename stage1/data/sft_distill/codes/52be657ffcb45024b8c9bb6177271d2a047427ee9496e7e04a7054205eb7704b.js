const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需加载外部资源
}

function create() {
  // 添加提示文字
  this.add.text(400, 30, '点击画面生成星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个随机颜色的星形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 星形中心 x 坐标
 * @param {number} y - 星形中心 y 坐标
 */
function createStar(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 生成随机颜色
  const color = Phaser.Display.Color.RandomRGB();
  const colorValue = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
  
  // 星形参数
  const points = 5;        // 星形的角数
  const outerRadius = 30;  // 外半径
  const innerRadius = 15;  // 内半径
  
  // 设置填充颜色
  graphics.fillStyle(colorValue, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形的各个顶点
  for (let i = 0; i < points * 2; i++) {
    // 每个点的角度
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算顶点坐标
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(pointX, pointY);
    } else {
      graphics.lineTo(pointX, pointY);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使星形更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokePath();
  
  // 添加缩放动画效果
  graphics.setScale(0);
  scene.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
}

new Phaser.Game(config);