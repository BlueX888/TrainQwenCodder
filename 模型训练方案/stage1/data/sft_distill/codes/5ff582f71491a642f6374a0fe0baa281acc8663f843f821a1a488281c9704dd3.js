const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量（可验证）
let currentState = 'idle';
let stateChangeCount = 0;

function preload() {
  // 程序化生成橙色角色纹理
  generateCharacterTextures.call(this);
}

function generateCharacterTextures() {
  const graphics = this.add.graphics();
  
  // 生成 idle 状态的 4 帧（呼吸效果）
  for (let i = 0; i < 4; i++) {
    graphics.clear();
    
    // 橙色身体（根据帧数调整大小实现呼吸效果）
    const scale = 1 + Math.sin(i * Math.PI / 2) * 0.1;
    const bodyWidth = 40 * scale;
    const bodyHeight = 60 * scale;
    
    graphics.fillStyle(0xFF8800, 1);
    graphics.fillRoundedRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight, 8);
    
    // 眼睛
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(-10, -10, 5);
    graphics.fillCircle(10, -10, 5);
    
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(-10, -10, 3);
    graphics.fillCircle(10, -10, 3);
    
    // 微笑
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginPath();
    graphics.arc(0, 5, 12, 0.2, Math.PI - 0.2);
    graphics.strokePath();
    
    graphics.generateTexture(`idle_${i}`, 80, 80);
  }
  
  // 生成 run 状态的 6 帧（跑步动画）
  for (let i = 0; i < 6; i++) {
    graphics.clear();
    
    // 身体倾斜角度
    const angle = Math.sin(i * Math.PI / 3) * 10;
    
    // 橙色身体
    graphics.fillStyle(0xFF8800, 1);
    graphics.save();
    graphics.translate(0, 0);
    graphics.rotate(angle * Math.PI / 180);
    graphics.fillRoundedRect(-20, -30, 40, 60, 8);
    graphics.restore();
    
    // 腿部（交替摆动）
    const legOffset = Math.sin(i * Math.PI / 3) * 10;
    graphics.fillStyle(0xFF6600, 1);
    graphics.fillRect(-15, 25, 10, 20 + legOffset);
    graphics.fillRect(5, 25, 10, 20 - legOffset);
    
    // 手臂（交替摆动）
    const armOffset = Math.sin(i * Math.PI / 3) * 8;
    graphics.fillRect(-25, -10 + armOffset, 8, 25);
    graphics.fillRect(17, -10 - armOffset, 8, 25);
    
    // 眼睛（专注表情）
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(-10, -10, 5);
    graphics.fillCircle(10, -10, 5);
    
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(-8, -10, 3);
    graphics.fillCircle(12, -10, 3);
    
    // 张开的嘴
    graphics.fillStyle(0x000000, 1);
    graphics.fillEllipse(0, 8, 10, 6);
    
    graphics.generateTexture(`run_${i}`, 80, 80);
  }
  
  graphics.destroy();
}

function create() {
  // 创建角色精灵
  this.player = this.add.sprite(400, 300, 'idle_0');
  this.player.setScale(2);
  
  // 创建 idle 动画
  this.anims.create({
    key: 'idle',
    frames: [
      { key: 'idle_0' },
      { key: 'idle_1' },
      { key: 'idle_2' },
      { key: 'idle_3' },
      { key: 'idle_2' },
      { key: 'idle_1' }
    ],
    frameRate: 6,
    repeat: -1
  });
  
  // 创建 run 动画
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'run_0' },
      { key: 'run_1' },
      { key: 'run_2' },
      { key: 'run_3' },
      { key: 'run_4' },
      { key: 'run_5' }
    ],
    frameRate: 12,
    repeat: -1
  });
  
  // 播放 idle 动画
  this.player.play('idle');
  
  // 状态显示文本
  this.stateText = this.add.text(20, 20, '', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 提示文本
  this.add.text(20, 560, 'Press SPACE to RUN | Release to IDLE', {
    fontSize: '18px',
    color: '#ffff00'
  });
  
  // 键盘输入
  this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 移动 tween（初始不激活）
  this.runTween = null;
  
  // 更新状态显示
  updateStateDisplay.call(this);
}

function update() {
  // 检测空格键状态
  if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
    // 切换到 run 状态
    if (currentState !== 'run') {
      currentState = 'run';
      stateChangeCount++;
      this.player.play('run');
      
      // 停止之前的 tween
      if (this.runTween) {
        this.runTween.stop();
      }
      
      // 创建左右移动的 tween
      this.runTween = this.tweens.add({
        targets: this.player,
        x: { from: 200, to: 600 },
        duration: 2000,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1
      });
      
      updateStateDisplay.call(this);
    }
  }
  
  if (Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
    // 切换到 idle 状态
    if (currentState !== 'idle') {
      currentState = 'idle';
      stateChangeCount++;
      this.player.play('idle');
      
      // 停止移动 tween
      if (this.runTween) {
        this.runTween.stop();
        this.runTween = null;
      }
      
      // 缓慢回到中心位置
      this.tweens.add({
        targets: this.player,
        x: 400,
        duration: 500,
        ease: 'Power2'
      });
      
      updateStateDisplay.call(this);
    }
  }
}

function updateStateDisplay() {
  this.stateText.setText(
    `State: ${currentState.toUpperCase()}\n` +
    `State Changes: ${stateChangeCount}`
  );
  
  // 根据状态改变文本颜色
  if (currentState === 'run') {
    this.stateText.setBackgroundColor('#ff0000');
  } else {
    this.stateText.setBackgroundColor('#000000');
  }
}

new Phaser.Game(config);