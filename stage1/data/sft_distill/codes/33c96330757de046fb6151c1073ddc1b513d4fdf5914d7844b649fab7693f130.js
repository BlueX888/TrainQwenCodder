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

let hexagon;
let pointer;
const FOLLOW_SPEED = 80;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制六边形（中心在原点）
  const hexRadius = 30;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = Math.cos(angle) * hexRadius;
    const y = Math.sin(angle) * hexRadius;
    hexPoints.push(x, y);
  }
  
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 显示提示文本
  this.add.text(10, 10, 'Move your mouse to control the hexagon', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算六边形与鼠标之间的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一个很小的阈值时才移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和 delta 计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      hexagon.x = pointer.x;
      hexagon.y = pointer.y;
    } else {
      // 计算新位置
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);