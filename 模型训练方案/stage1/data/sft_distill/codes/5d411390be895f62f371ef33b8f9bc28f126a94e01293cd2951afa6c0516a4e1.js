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

// 游戏状态变量
let player;
let enemy;
let playerHealth = 100;
let isInvincible = false;
let blinkTimer = null;
let healthText;
let statusText;

function preload() {
  // 创建粉色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('player', 40, 40);
  graphics.clear();
  
  // 创建敌人纹理（红色）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('enemy', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建玩家（粉色角色）
  player = this.physics.add.sprite(200, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人
  enemy = this.physics.add.sprite(600, 300, 'enemy');
  enemy.setCollideWorldBounds(true);
  
  // 让敌人缓慢移动（用于触发碰撞）
  this.physics.moveToObject(enemy, player, 50);
  
  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);
  
  // 添加键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 显示健康值
  healthText = this.add.text(16, 16, `Health: ${playerHealth}`, {
    fontSize: '24px',
    fill: '#fff'
  });
  
  // 显示状态信息
  statusText = this.add.text(16, 50, 'Status: Normal', {
    fontSize: '20px',
    fill: '#00ff00'
  });
  
  // 添加说明文字
  this.add.text(16, 550, 'Use Arrow Keys to Move | Collide with Red Enemy to Test Hurt Effect', {
    fontSize: '16px',
    fill: '#aaa'
  });
}

function update() {
  // 玩家移动控制
  if (!isInvincible) {
    player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      player.setVelocityX(160);
    }
    
    if (this.cursors.up.isDown) {
      player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      player.setVelocityY(160);
    }
  }
  
  // 敌人持续追踪玩家（仅在玩家不处于无敌状态时）
  if (!isInvincible && Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) > 50) {
    this.physics.moveToObject(enemy, player, 50);
  } else if (isInvincible) {
    enemy.setVelocity(0);
  }
}

function handleCollision(player, enemy) {
  // 如果已经处于无敌状态，不再触发受伤
  if (isInvincible) {
    return;
  }
  
  // 扣除生命值
  playerHealth -= 10;
  healthText.setText(`Health: ${playerHealth}`);
  
  // 设置无敌状态
  isInvincible = true;
  statusText.setText('Status: Hurt (Invincible)');
  statusText.setColor('#ff0000');
  
  // 计算击退方向（从敌人指向玩家）
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  
  // 击退距离基于速度80计算（速度80，持续0.3秒，距离约为24像素）
  const knockbackSpeed = 80;
  const knockbackDuration = 300; // 毫秒
  const knockbackDistance = (knockbackSpeed * knockbackDuration) / 1000;
  
  // 计算击退目标位置
  const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
  const knockbackY = player.y + Math.sin(angle) * knockbackDistance;
  
  // 停止玩家当前速度
  player.setVelocity(0);
  
  // 使用Tween实现击退效果
  this.tweens.add({
    targets: player,
    x: knockbackX,
    y: knockbackY,
    duration: knockbackDuration,
    ease: 'Cubic.easeOut'
  });
  
  // 实现闪烁效果（2秒，每100ms切换一次透明度）
  let blinkCount = 0;
  const maxBlinks = 20; // 2000ms / 100ms = 20次
  
  if (blinkTimer) {
    blinkTimer.remove();
  }
  
  blinkTimer = this.time.addEvent({
    delay: 100,
    callback: () => {
      blinkCount++;
      // 切换透明度
      player.alpha = player.alpha === 1 ? 0.3 : 1;
      
      // 2秒后结束闪烁
      if (blinkCount >= maxBlinks) {
        player.alpha = 1;
        isInvincible = false;
        statusText.setText('Status: Normal');
        statusText.setColor('#00ff00');
        blinkTimer.remove();
        blinkTimer = null;
        
        // 恢复敌人追踪
        this.physics.moveToObject(enemy, player, 50);
      }
    },
    loop: true
  });
  
  // 检查游戏结束
  if (playerHealth <= 0) {
    statusText.setText('Status: Dead');
    statusText.setColor('#ff0000');
    this.physics.pause();
    
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000'
    }).setOrigin(0.5);
  }
}

const game = new Phaser.Game(config);