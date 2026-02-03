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
const FOLLOW_SPEED = 120; // 每秒移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 30;
  const hexColor = 0x808080; // 灰色
  
  // 绘制六边形
  graphics.fillStyle(hexColor, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算六边形中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间增量计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      hexagon.x = pointer.x;
      hexagon.y = pointer.y;
    } else {
      // 否则按角度移动
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);