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
const MOVE_SPEED = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格范围更大，以便看到相机跟随效果
  for (let x = -2000; x <= 2000; x += 100) {
    graphics.moveTo(x, -2000);
    graphics.lineTo(x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    graphics.moveTo(-2000, y);
    graphics.lineTo(2000, y);
  }
  graphics.strokePath();
  
  // 添加网格坐标标签
  const style = { fontSize: '12px', fill: '#00ff00' };
  for (let x = -2000; x <= 2000; x += 200) {
    for (let y = -2000; y <= 2000; y += 200) {
      this.add.text(x + 5, y + 5, `${x},${y}`, style);
    }
  }
  
  // 创建玩家矩形（使用 Rectangle 游戏对象）
  player = this.add.rectangle(400, 300, 40, 40, 0xff0000);
  
  // 添加一个白色边框使其更明显
  const border = this.add.graphics();
  border.lineStyle(2, 0xffffff, 1);
  border.strokeRect(-20, -20, 40, 40);
  
  // 将边框附加到玩家对象上
  this.add.container(0, 0, [player, border]);
  
  // 设置相机跟随玩家矩形
  this.cameras.main.startFollow(player);
  
  // 可选：设置相机边界（让相机可以无限跟随）
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加提示文本（固定在相机上）
  const instructionText = this.add.text(10, 10, 
    '红色矩形自动向左上移动\n相机跟随并保持居中', 
    { 
      fontSize: '16px', 
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  instructionText.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让矩形向左上方移动
  // 左上方：x 减小（向左），y 减小（向上）
  player.x -= MOVE_SPEED;
  player.y -= MOVE_SPEED;
  
  // 可选：显示当前位置（用于调试）
  // console.log(`Player position: (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`);
}

new Phaser.Game(config);