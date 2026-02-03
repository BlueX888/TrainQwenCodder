const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let diamond;
let pointer;
const FOLLOW_SPEED = 300; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制菱形（四个顶点）
  graphics.beginPath();
  graphics.moveTo(0, -30);  // 上顶点
  graphics.lineTo(30, 0);   // 右顶点
  graphics.lineTo(0, 30);   // 下顶点
  graphics.lineTo(-30, 0);  // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamondTexture', 60, 60);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamondTexture');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to guide the diamond', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算菱形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    diamond.x,
    diamond.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动菱形
  if (distance > 1) {
    // 计算从菱形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      diamond.x,
      diamond.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      diamond.x = pointer.x;
      diamond.y = pointer.y;
    } else {
      // 否则按照角度方向移动
      diamond.x += Math.cos(angle) * moveDistance;
      diamond.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);