const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let player;
let cursors;
let skillCooldown = false;
let cooldownTimer = null;
let cooldownProgress = 0;
let skillUseCount = 0;

// UI 元素
let cooldownBar;
let cooldownBarBg;
let statusText;
let instructionText;
let activeSkills = [];

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家角色（使用 Graphics 绘制）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillCircle(0, 0, 20);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  player = this.add.sprite(400, 300, 'player');

  // 创建冷却条背景
  cooldownBarBg = this.add.graphics();
  cooldownBarBg.fillStyle(0x333333, 1);
  cooldownBarBg.fillRect(300, 50, 200, 20);

  // 创建冷却条
  cooldownBar = this.add.graphics();

  // 创建状态文本
  statusText = this.add.text(400, 100, 'Skills Used: 0 | Status: Ready', {
    fontSize: '18px',
    fill: '#00ff00',
    align: 'center'
  });
  statusText.setOrigin(0.5);

  // 创建指示文本
  instructionText = this.add.text(400, 550, 'Press Arrow Keys to Cast Green Skill (2s Cooldown)', {
    fontSize: '16px',
    fill: '#ffffff',
    align: 'center'
  });
  instructionText.setOrigin(0.5);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 监听方向键按下事件
  this.input.keyboard.on('keydown', (event) => {
    if (skillCooldown) return;

    let direction = null;
    let angle = 0;

    switch(event.code) {
      case 'ArrowUp':
        direction = 'UP';
        angle = -90;
        break;
      case 'ArrowDown':
        direction = 'DOWN';
        angle = 90;
        break;
      case 'ArrowLeft':
        direction = 'LEFT';
        angle = 180;
        break;
      case 'ArrowRight':
        direction = 'RIGHT';
        angle = 0;
        break;
    }

    if (direction) {
      castSkill.call(this, direction, angle);
    }
  });
}

function castSkill(direction, angle) {
  // 释放技能
  skillUseCount++;
  skillCooldown = true;

  // 创建技能特效（绿色光束）
  const skillGraphics = this.add.graphics();
  skillGraphics.fillStyle(0x00ff00, 0.8);
  
  // 根据方向绘制技能特效
  const startX = player.x;
  const startY = player.y;
  const length = 150;
  const width = 30;

  skillGraphics.save();
  skillGraphics.translateCanvas(startX, startY);
  skillGraphics.rotateCanvas(Phaser.Math.DegToRad(angle));
  
  // 绘制光束
  skillGraphics.fillRect(0, -width/2, length, width);
  
  // 绘制光束头部（三角形）
  skillGraphics.beginPath();
  skillGraphics.moveTo(length, 0);
  skillGraphics.lineTo(length - 20, -width/2 - 10);
  skillGraphics.lineTo(length - 20, width/2 + 10);
  skillGraphics.closePath();
  skillGraphics.fillPath();
  
  skillGraphics.restore();

  activeSkills.push(skillGraphics);

  // 技能特效动画（淡出）
  this.tweens.add({
    targets: skillGraphics,
    alpha: 0,
    duration: 500,
    ease: 'Power2',
    onComplete: () => {
      skillGraphics.destroy();
      const index = activeSkills.indexOf(skillGraphics);
      if (index > -1) {
        activeSkills.splice(index, 1);
      }
    }
  });

  // 开始冷却
  startCooldown.call(this);

  // 更新状态文本
  updateStatusText();
}

function startCooldown() {
  cooldownProgress = 0;
  
  // 创建冷却计时器
  cooldownTimer = this.time.addEvent({
    delay: 2000,
    callback: () => {
      skillCooldown = false;
      cooldownProgress = 0;
      cooldownBar.clear();
      updateStatusText();
    },
    callbackScope: this
  });
}

function updateStatusText() {
  const status = skillCooldown ? 'Cooling Down' : 'Ready';
  const color = skillCooldown ? '#ff0000' : '#00ff00';
  statusText.setText(`Skills Used: ${skillUseCount} | Status: ${status}`);
  statusText.setColor(color);
}

function update(time, delta) {
  // 更新冷却进度条
  if (skillCooldown && cooldownTimer) {
    cooldownProgress = cooldownTimer.getProgress();
    
    // 绘制冷却进度
    cooldownBar.clear();
    cooldownBar.fillStyle(0x00ff00, 1);
    const barWidth = 200 * cooldownProgress;
    cooldownBar.fillRect(300, 50, barWidth, 20);

    // 绘制进度文本
    const remainingTime = (2 - cooldownTimer.getElapsed() / 1000).toFixed(1);
    if (!this.cooldownText) {
      this.cooldownText = this.add.text(400, 60, '', {
        fontSize: '14px',
        fill: '#ffffff'
      });
      this.cooldownText.setOrigin(0.5);
    }
    this.cooldownText.setText(`${remainingTime}s`);
  } else {
    if (this.cooldownText) {
      this.cooldownText.setText('');
    }
  }

  // 简单的玩家移动（可选，增强交互性）
  const speed = 3;
  if (cursors.up.isDown && !skillCooldown) {
    player.y -= speed;
  }
  if (cursors.down.isDown && !skillCooldown) {
    player.y += speed;
  }
  if (cursors.left.isDown && !skillCooldown) {
    player.x -= speed;
  }
  if (cursors.right.isDown && !skillCooldown) {
    player.x += speed;
  }

  // 限制玩家在屏幕内
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

new Phaser.Game(config);