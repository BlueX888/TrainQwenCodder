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
let moveSpeed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个大的世界边界，让相机有足够的空间跟随
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 绘制背景网格作为参考，帮助观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    graphics.lineBetween(x, 0, x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    graphics.lineBetween(0, y, 2000, y);
  }
  
  // 添加坐标标记
  const textStyle = { 
    fontSize: '14px', 
    color: '#00ff00',
    backgroundColor: '#000000'
  };
  
  for (let x = 0; x <= 2000; x += 200) {
    for (let y = 0; y <= 2000; y += 200) {
      this.add.text(x + 5, y + 5, `${x},${y}`, textStyle);
    }
  }
  
  // 创建玩家矩形（使用 Rectangle 游戏对象）
  player = this.add.rectangle(400, 1500, 40, 40, 0xff0000);
  
  // 设置相机跟随玩家，保持居中
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（这里不设置，保持默认居中）
  // this.cameras.main.setFollowOffset(0, 0);
  
  // 添加提示文本（固定在相机视图上）
  const infoText = this.add.text(10, 10, '相机跟随矩形移动中...', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 设置文本固定在相机上，不随世界移动
  infoText.setScrollFactor(0);
  
  // 添加实时坐标显示
  this.positionText = this.add.text(10, 40, '', {
    fontSize: '16px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 让矩形向右上方移动
  player.x += moveSpeed;
  player.y -= moveSpeed;
  
  // 更新位置显示
  this.positionText.setText(
    `位置: (${Math.round(player.x)}, ${Math.round(player.y)})`
  );
  
  // 可选：当矩形到达边界时重置位置
  if (player.x > 1900 || player.y < 100) {
    player.x = 400;
    player.y = 1500;
  }
}

// 创建游戏实例
new Phaser.Game(config);