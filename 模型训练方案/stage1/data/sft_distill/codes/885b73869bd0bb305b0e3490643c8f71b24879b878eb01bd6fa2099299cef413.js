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
let keyW, keyA, keyS, keyD;
const SPEED = 80; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 30;
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 绘制六边形（6个顶点）
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0x00aa00, 1);
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，放置在屏幕中央
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置 WASD 键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // 计算本帧应移动的距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keyW.isDown) {
    hexagon.y -= distance;
  }
  if (keyS.isDown) {
    hexagon.y += distance;
  }
  if (keyA.isDown) {
    hexagon.x -= distance;
  }
  if (keyD.isDown) {
    hexagon.x += distance;
  }
  
  // 边界限制（可选）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);