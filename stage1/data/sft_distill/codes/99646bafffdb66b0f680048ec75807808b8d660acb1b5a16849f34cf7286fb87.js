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

let player;
let speed = 150; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 程序化生成圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制圆形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  
  // 生成纹理
  graphics.generateTexture('playerCircle', 50, 50);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建一些背景参考物体，用于观察相机移动效果
  const backgroundGraphics = this.add.graphics();
  backgroundGraphics.lineStyle(2, 0x666666, 1);
  
  // 绘制网格作为背景参考
  for (let x = 0; x < 5000; x += 100) {
    backgroundGraphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y < 600; y += 100) {
    backgroundGraphics.lineBetween(0, y, 5000, y);
  }
  
  // 添加一些标记点
  for (let i = 0; i < 50; i++) {
    const marker = this.add.text(i * 100, 300, `${i * 100}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }
  
  // 创建玩家对象（使用生成的圆形纹理）
  player = this.add.sprite(100, 300, 'playerCircle');
  
  // 设置世界边界（扩大场景范围）
  this.cameras.main.setBounds(0, 0, 5000, 600);
  
  // 让相机跟随玩家对象
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的平滑度
  // 参数说明：startFollow(target, roundPixels, lerpX, lerpY)
  // roundPixels: 是否对像素进行四舍五入
  // lerpX, lerpY: 相机跟随的平滑度（0-1），值越小越平滑
  
  // 添加提示文本（固定在相机上）
  const instructionText = this.add.text(10, 10, '相机正在跟随绿色圆形', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setScrollFactor(0); // 固定在相机上，不随场景滚动
  
  const positionText = this.add.text(10, 50, '', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  positionText.setScrollFactor(0);
  
  // 保存引用以便在 update 中更新
  this.positionText = positionText;
}

function update(time, delta) {
  // 自动向右移动玩家对象
  // delta 是距离上一帧的时间（毫秒）
  player.x += speed * (delta / 1000);
  
  // 更新位置显示
  if (this.positionText) {
    this.positionText.setText(`位置: ${Math.floor(player.x)}, ${Math.floor(player.y)}`);
  }
  
  // 可选：当到达边界时停止或循环
  if (player.x > 4900) {
    player.x = 100; // 重置到起点
  }
}

// 创建游戏实例
new Phaser.Game(config);