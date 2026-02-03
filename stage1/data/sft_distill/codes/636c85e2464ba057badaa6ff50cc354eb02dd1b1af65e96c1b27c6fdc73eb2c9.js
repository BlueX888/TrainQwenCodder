const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let bullets;
let player;
let spaceKey;
let lastFired = 0;
let fireRate = 200; // 发射间隔（毫秒）
let bulletsFired = 0; // 可验证状态信号：已发射子弹数

function preload() {
  // 使用 Graphics 创建蓝色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0088ff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
  
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建子弹对象池（物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 初始化子弹
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
  
  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 添加UI文本显示状态
  this.add.text(10, 10, '按空格键发射子弹', { 
    fontSize: '18px', 
    color: '#ffffff' 
  });
  
  this.bulletCountText = this.add.text(10, 40, '已发射: 0', { 
    fontSize: '16px', 
    color: '#00ff00' 
  });
  
  this.poolStatusText = this.add.text(10, 70, '对象池: 0/50', { 
    fontSize: '16px', 
    color: '#ffaa00' 
  });
}

function update(time, delta) {
  // 检测空格键按下并发射子弹
  if (spaceKey.isDown && time > lastFired + fireRate) {
    fireBullet(time);
  }
  
  // 检查子弹边界并回收
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      // 检查是否超出屏幕边界
      if (bullet.y < -20 || bullet.y > 620 || 
          bullet.x < -20 || bullet.x > 820) {
        recycleBullet(bullet);
      }
    }
  });
  
  // 更新UI显示
  this.bulletCountText.setText('已发射: ' + bulletsFired);
  const activeCount = bullets.countActive(true);
  this.poolStatusText.setText('对象池: ' + activeCount + '/' + bullets.maxSize);
}

function fireBullet(time) {
  // 从对象池获取子弹
  let bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-240); // 向上发射，速度 240
    
    lastFired = time;
    bulletsFired++;
    
    console.log('子弹发射！总计:', bulletsFired);
  } else {
    console.log('对象池已满，无法发射');
  }
}

function recycleBullet(bullet) {
  // 回收子弹到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);
  bullet.x = 0;
  bullet.y = 0;
  
  console.log('子弹已回收到对象池');
}

const game = new Phaser.Game(config);